import Model from "flarum/common/Model";

export default class Platform extends Model {
  name = Model.attribute<string>("name");
  iconUrl = Model.attribute<string | null>("iconUrl");
  iconClass = Model.attribute<string | null>("iconClass");
  isActive = Model.attribute<boolean>("isActive");
  displayOrder = Model.attribute<number>("displayOrder");
  usesUrlIcon = Model.attribute<boolean>("usesUrlIcon");
  usesCssIcon = Model.attribute<boolean>("usesCssIcon");

  apiEndpoint(): string {
    return "/tournament/platforms";
  }
}
