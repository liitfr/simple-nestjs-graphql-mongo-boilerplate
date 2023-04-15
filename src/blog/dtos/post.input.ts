import { InputType } from '@nestjs/graphql';

import { SimpleVersionedEntityInputFactory } from '../../versioning/factories/simple-versioned-entity-input.factory';

import { Post } from '../entities/post.entity';

@InputType({ description: 'Post Input' })
export class PostInput extends SimpleVersionedEntityInputFactory(Post) {}
