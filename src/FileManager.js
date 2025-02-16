const fs = require('fs').promises;

/**
 * Manages the handling of files and directories 
 * @typedef {Object} FileManager
 */
class FileManager {
  /**
   * Creates a directory in the given path
   * @param {string} dirPath - directory path
   * @param {boolean} recursive - creates parent directories if non-existing (`default = false`)
   */
  async createDirectory(dirPath, recursive = false) {
    try {
      await fs.mkdir(dirPath, { recursive });
      console.log(`directory already exist or it was created: ${dirPath}`);
    } catch (error) {
      console.error(`Error creating directory ${dirPath}: ${error}`);
      throw error;
    }
  }

  /**
   * Deletes directory at path
   * @param {string} dirPath - path to delete
   */
  async deleteDirectory(dirPath) {
    return this.deletePath(dirPath, true)
  }

  /**
   * Deletes directory at path
   * @param {string} dirPath - path to delete
   */
  async directoryExists(dirPath) {
    return this.pathExist(dirPath)
  }

  /**
   * Asynchronously reads the entire contents of a file.
   * @param {string} filePath - path of file to read
   * @param {string} options - character encoding to use (`default = utf8`)
   * @returns 
   */
  async readFile(filePath, options) {
    try {
      const data = await fs.readFile(filePath, options);
      console.log(`Read file at path: ${filePath}`);
      return data;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error('File not found:', error.message); // Handle file not found
      } else {
        console.error('Error reading file:', error); // Handle other errors
      }
      throw error;
    }
  }

  /**
   * Asynchronously writes data to the file, replacing the file if it already exists
   * @param {string} filePath - path of file to write
   * @param {string} data  - contents to write on file
   */
  async writeFile(filePath, data) {
    try {
      await fs.writeFile(filePath, data);
      console.log(`Wrote data to file at: ${filePath}`);
    } catch (error) {
      console.error(`Error writing file at ${filePath}: ${error}`);
      throw error;
    }
  }

  /**
   * Asynchronously append data to a file, creating the file if it does not yet exist
   * @param {string} filePath - path of file to write
   * @param {string} data  - contents to append to file
   */
  async appendToFile(filePath, data) {
    try {
      await fs.appendFile(filePath, data);
      console.log(`Appended data to file at path: ${filePath}`);
    } catch (error) {
      console.error(`Error appending to file ${filePath}: ${error}`);
      throw error;
    }
  }

  /**
   * Deletes a file
   * @param {string} filePath - path of file to delete
   */
  async deleteFile(filePath) {
    return await this.deletePath(filePath);
  }

  /**
   * Returns `true` if the file exists, `false` otherwise.
   * @param {string} filePath - path of file
   */
  async fileExists(filePath) {
    return await this.pathExist(filePath);
  }

  /**
   * Saves the array of json testcase data as a json file in the given path
   * @param {string} filePath - The path to store the markdown file in
   * @param {Array<TestCase>} data - array of json data for each testcase
   * @param {boolean} prettyPrint - saves json file with pretty print (`default = false`)
   */
  async saveJson(filePath, data, prettyPrint) {
    try {
      if (prettyPrint) {
        data = JSON.stringify(data, null, 2); // Prettified JSON
      }

      await fs.writeFile(filePath, data);
      console.log(`JSON file saved at path ${filePath}`);
    } catch (error) {
      console.error(`Error saving JSON file ${filePath}: ${error}`);
      throw error;
    }
  }

  /**
   * Deletes the input path. if path is a `non-empty` directory,
   * `recursive` must equal `true`
   * @param {string} path - path to delete
   * @param {boolean} recursive - delete non-empty directory
   */
  async deletePath(path, recursive = false) {
    try {
      if (this.pathExist(path)) {
        await fs.rm(path, { recursive });
        console.log(`Deleted path: ${path}`);
      } else {
        console.warn(`Non-existing path can't be removed: ${path}`);
      }
    } catch (error) {
      console.error(`Error deleting ${path}: ${error}`);
      throw error;
    }
  }

  /**
   * Returns `true` if the path exists, `false` otherwise.
   * @param {string} path 
   * @returns {Promise<boolean>}
   */
  async pathExist(path) {
    try {
      return await fs.existsSync(path);
    } catch (error) {
      console.error(`Error verifying existance of path ${path}: ${error}`);
      throw error;
    }
  }
}

module.exports = { FileManager }