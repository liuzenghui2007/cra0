// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from "@feathersjs/feathers";
const sharp = require("sharp");
import { v4 as uuidv4 } from "uuid";
// eslint-disable-next-line @typescript-eslint/no-unused-vars

const savePicture = async (pos: string, context: HookContext) => {
  const fileName = context.data.rid + '-' + pos
  const imgData = context.data[pos];
  // console.log('ddddddddddd', pos, imgData)
  const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
  const dataBuffer = Buffer.from(base64Data, "base64");
  const dir = "/data/pics/";
  await sharp(dataBuffer).rotate(90).toFile(dir + fileName + ".png");
};
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    // console.log(context.data)

    context.data.rid = uuidv4()
    await savePicture("top", context);
    await savePicture("bottom", context);
    await savePicture("face", context);
    return context;
  };
};


// GeneralError {type: 'FeathersError', name: 'GeneralError', message: 'Input Buffer is empty',