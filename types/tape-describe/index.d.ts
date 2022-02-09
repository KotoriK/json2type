import tape from "tape";

function describe(blockName: string): typeof tape
function describe(blockName: string, callback: (arg_test: typeof tape) => void): void
export default describe
