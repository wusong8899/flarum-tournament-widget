import Extend from "flarum/common/extenders";
import Participant from "./models/Participant";
import Platform from "./models/Platform";

export default [
  new Extend.Store()
    .add("participants", Participant)
    .add("platforms", Platform),
];
