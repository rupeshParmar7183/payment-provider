import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';

import { User } from './user.model';
import { TransactionStatus } from '../common/enums/transaction-status.enum';

@Table({
  tableName: 'transactions',
  timestamps: true,
})
export class Transaction extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @Column({
    allowNull: false,
  })
  declare cardToken: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare amount: number;

  @Column({
    allowNull: false,
  })
  declare currency: string;

  @Column({
    type: DataType.ENUM(...Object.values(TransactionStatus)),
    allowNull: false,
  })
  declare status: TransactionStatus;

  @Column({
    allowNull: true,
  })
  declare authorizationCode: string;

  @Column({
    allowNull: true,
  })
  declare failureReason: string;

  @Column({
    defaultValue: 0,
  })
  declare retryCount: number;
}