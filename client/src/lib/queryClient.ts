import { QueryClient, QueryFunction } from "@tanstack/react-query";
import {
  BackendRequiredError,
  markBackendReachable,
  staticGet,
} from "./staticData";

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * A static host answers /api/* with its own HTML 404 page, whereas the Express
 * app always answers JSON — including for genuine 404s like an unknown incident
 * id. So content-type, not status, is what tells "no backend deployed" apart
 * from "backend said no".
 */
function looksLikeApiResponse(res: Response) {
  return (res.headers.get("content-type") || "").includes("application/json");
}

/** GETs degrade to the static dataset; writes cannot and must fail loudly. */
async function get(url: string): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${url}`);
  } catch (err) {
    return staticGet(url, `GET ${url} could not reach a backend`);
  }

  if (looksLikeApiResponse(res)) {
    markBackendReachable();
    await throwIfResNotOk(res);
    return res;
  }

  return staticGet(url, `GET ${url} returned HTTP ${res.status} and no JSON body`);
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  if (method.toUpperCase() === "GET") return get(url);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${url}`, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
    });
  } catch {
    throw new BackendRequiredError(`${method} ${url}`);
  }

  if (!looksLikeApiResponse(res)) throw new BackendRequiredError(`${method} ${url}`);

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await get(queryKey.join("/"));

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
