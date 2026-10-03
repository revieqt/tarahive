import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  AiConversation,
} from './ai-conversations.entity';

export enum AiMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  TOOL = 'tool',
}

@Entity('ai_messages')
export class AiMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId!: string;

  @ManyToOne(
    () => AiConversation,
    (conversation) => conversation.messages,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'conversation_id' })
  conversation!: AiConversation;

  @Column({
    type: 'enum',
    enum: AiMessageRole,
  })
  role!: AiMessageRole;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    name: 'tool_name',
    type: 'varchar',
    nullable: true,
  })
  toolName!: string | null;

  @Column({
    name: 'tool_call_id',
    type: 'varchar',
    nullable: true,
  })
  toolCallId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}