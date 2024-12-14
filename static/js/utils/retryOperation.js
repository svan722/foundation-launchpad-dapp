export async function retryOperation(operation, ...args) {
  let maxRetries = 5;

  for (let retryCount = 0; retryCount < maxRetries; retryCount++) {
    console.log(retryCount);
    try {
      // Attempt the operation with the provided arguments
      const data = await operation(...args);
      return data; // If successful, exit the loop
    } catch (error) {
      if (retryCount === maxRetries - 1) {
        throw error; // If the last retry, rethrow the error
      }
    }
  }
}
