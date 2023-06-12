import { zip } from "zip-a-folder";

export const zipFolder = async (pathToFolder: string) => {
    await zip(pathToFolder, `${pathToFolder}.zip`);
};
