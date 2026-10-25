import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20261025120000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`alter table if exists "store" alter column "name" set default 'Pagly';`)
  }

  async down(): Promise<void> {
    this.addSql(`alter table if exists "store" alter column "name" set default 'Medusa Store';`)
  }
}
