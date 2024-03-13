
export const queryOne = async (category: string, query: string): Promise<string> => {
    return fetch("/llm", {
      method: "POST", // Specify the method
      headers: {
        "Content-Type": "application/json", // Specify the content type
      },
      body: JSON.stringify({
        category,
        query,
      }), // Convert the JavaScript object to a JSON string
    })
      .then((response) => response.json()) // Parse the JSON response
      .then((data) => {
        return data.data;
      })
      .catch((error) => {
        console.error("Error:", error); // Handle any errors
      });
}