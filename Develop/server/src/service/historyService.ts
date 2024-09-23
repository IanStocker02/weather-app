import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Import this to work with ES modules
import { v4 as uuidv4 } from "uuid";

// Emulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class City {
  constructor(
    public name: string,
    public id: string = uuidv4(),
    public lat: number = 0,
    public lon: number = 0
  ) {}
}

class HistoryService {
  private filePath: string;

  constructor() {
    // Dynamically set the path using the 'path' package and __dirname
    this.filePath = path.resolve(__dirname, "searchHistory.json");
  }

  private async read(): Promise<City[]> {
    try {
      const fileData = await fs.promises.readFile(this.filePath, "utf8");
      return JSON.parse(fileData);
    } catch (error) {
      console.error("Error reading file:", error);
      return [];
    }
  }

  private async write(cities: City[]): Promise<void> {
    try {
      await fs.promises.writeFile(this.filePath, JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error("Error writing to file:", error);
    }
  }

  public async getCities(): Promise<City[]> {
    return this.read();
  }

  public async addCity(name: string, lat: number, lon: number): Promise<void> {
    const cities = await this.getCities();
    const newCity = new City(name, uuidv4(), lat, lon);
    cities.push(newCity);
    await this.write(cities);
    console.log(`${name} added to search history!`);
  }

  public async removeCity(id: string): Promise<void> {
    const cities = await this.getCities();
    const updatedCities = cities.filter(city => city.id !== id);
    await this.write(updatedCities);
  }
}

export default new HistoryService();