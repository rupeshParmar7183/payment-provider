import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';

@Table({
  tableName: 'idempotency_keys',
  timestamps: true,
})
export class IdempotencyKey extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    allowNull: false,
    unique: true,
  })
  declare idempotencyKey: string;

  @Column({
    allowNull: false,
  })
  declare transactionId: string;
}