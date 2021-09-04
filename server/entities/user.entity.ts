import {
  Entity,
  Property,
  Unique,
} from '@mikro-orm/core';
import { ObjectType, Field } from "type-graphql";
import { Base } from './base.entity';

class UserConstructor {
  twitch_id?: string;
}

@ObjectType()
@Entity()
export class User extends Base<User> {
  @Field()
  @Property({ nullable: true })
  twitch_id: string;

  constructor(input: UserConstructor) {
    super();
    this.twitch_id = input.twitch_id ?? "";
  }  
}