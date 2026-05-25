import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';

import { User } from './user.model';

@Table({
  tableName: 'cards',
  timestamps: true,
})
export class Card extends Model {
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
    unique: true,
  })
  declare cardToken: string;

  @Column({
    allowNull: false,
  })
  declare maskedCardNumber: string;

  @Column({
    allowNull: false,
  })
  declare expiryMonth: number;

  @Column({
    allowNull: false,
  })
  declare expiryYear: number;

  @Column({
    allowNull: true,
  })
  declare cardBrand: string;
}