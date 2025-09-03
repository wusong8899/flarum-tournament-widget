import Model from "flarum/common/Model";
import User from "flarum/common/models/User";
import Platform from "./Platform";

export default class Participant extends Model {
  platformAccount = Model.attribute<string>("platformAccount");
  platformUsername = Model.attribute<string>("platformUsername");
  score = Model.attribute<number>("score");
  initialScore = Model.attribute<number>("initialScore");
  isApproved = Model.attribute<boolean>("isApproved");
  approvedAt = Model.attribute<Date | null>(
    "approvedAt",
    (attr: unknown) =>
      Model.transformDate(attr as string | null | undefined) ?? null
  );
  createdAt = Model.attribute<Date | null>(
    "createdAt",
    (attr: unknown) =>
      Model.transformDate(attr as string | null | undefined) ?? null
  );
  updatedAt = Model.attribute<Date | null>(
    "updatedAt",
    (attr: unknown) =>
      Model.transformDate(attr as string | null | undefined) ?? null
  );

  user = Model.hasOne<User>("user");
  platform = Model.hasOne<Platform>("platform");
  approvedBy = Model.hasOne<User>("approvedBy");

  apiEndpoint(): string {
    return "/tournament/participants";
  }
}
