type CsrfResponse = { csrfToken?: string };

export const fetchCsrfToken = async () => {
  const response = await fetch("/api/admin/csrf", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to initialize secure session");
  }

  const data = (await response.json()) as CsrfResponse;
  if (!data.csrfToken) {
    throw new Error("Missing CSRF token");
  }

  return data.csrfToken;
};
