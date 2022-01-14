// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from "@feathersjs/feathers";
const sharp = require("sharp");
// eslint-disable-next-line @typescript-eslint/no-unused-vars

const savePicture = async (pos: string, context: HookContext) => {
  const imgData = context.data[pos];
  const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
  const dataBuffer = Buffer.from(base64Data, "base64");
  const dir = "/data/pics/";
  await sharp(dataBuffer).rotate(90).toFile(dir + pos + ".png");
};
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    // console.log(context.data)

    await savePicture("top", context);
    await savePicture("bottom", context);
    await savePicture("face", context);
    return context;
  };
};


// GeneralError {type: 'FeathersError', name: 'GeneralError', message: 'Input Buffer is empty',