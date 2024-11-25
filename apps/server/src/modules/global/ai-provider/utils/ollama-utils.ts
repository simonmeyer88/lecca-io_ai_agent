import { exec } from 'child_process';

const ollamaCommandExists = (command: string): Promise<boolean> => {
  return new Promise((resolve) => {
    exec(`command -v ${command}`, (_, stdout) => {
      if (stdout.length) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

export const checkIfOllamaIsRunning = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    ollamaCommandExists('ollama').then((exists) => {
      if (exists) {
        exec('ollama', (error) => {
          if (error) {
            reject(error); // Not running or an error occurred
          }
          resolve(true);
        });
      } else {
        resolve(false);
      }
    });
  });
};

export const listOllamaLlmModels = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    exec('ollama list', (error, stdout, stderr) => {
      if (error) {
        reject(`Error retrieving models: ${stderr}`); // Handle error
      }

      const lines = stdout.split('\n');
      const models: string[] = [];

      // Skip the header and process the remaining lines
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const parts = line.split(/\s+/); // Split by whitespace
          models.push((parts as any)[0]); // Add the model name (first column)
        }
      }

      resolve(models); // Return the list of model names
    });
  });
};
