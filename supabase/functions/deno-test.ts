console.log("Hello from Deno!");
console.log("Deno version:", Deno.version.deno);
console.log("TypeScript version:", Deno.version.typescript);
console.log("V8 version:", Deno.version.v8);

// Test Fetch API
const fetchData = async () => {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    const data = await response.json();
    console.log("Fetch API working:", data);
  } catch (error) {
    console.error("Fetch API error:", error);
  }
};

fetchData();
