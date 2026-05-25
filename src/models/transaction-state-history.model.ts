import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';

import { Transaction } from './transaction.model';

@Table({
  tableName: 'transaction_state_history',
  timestamps: true,
})
export class TransactionStateHistory extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Transaction)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare transactionId: string;

  @Column({
    allowNull: false,
  })
  declare fromState: string;

  @Column({
    allowNull: false,
  })
  declare toState: string;

  @Column({
    allowNull: true,
  })
  declare reason: string;
}