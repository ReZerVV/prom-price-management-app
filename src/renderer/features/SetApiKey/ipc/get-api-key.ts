import { useQuery } from "@tanstack/react-query"

export async function getApiKey(): Promise<string> {
  return "asdjkasfjkajfkafkajla-askflajfasjkdk"
}

export function useGetApiKeyQuery() {
  return useQuery({
    queryKey: ["get-api-key"],
    queryFn: () => getApiKey(),
  })
}
