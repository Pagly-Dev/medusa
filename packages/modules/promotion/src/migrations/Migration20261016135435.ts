import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20261016135435 extends Migration {
  override async up(): Promise<void> {
    // Pagly: offer is a promotion type of its own, owned by a Pagly offer (quantity breaks, bundles).
    this.addSql(
      `alter table if exists "promotion" drop constraint if exists "promotion_type_check";`
    )
    this.addSql(
      `alter table if exists "promotion" add constraint "promotion_type_check" check("type" in ('standard', 'buyget', 'bank', 'offer'));`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "promotion" drop constraint if exists "promotion_type_check";`
    )
    this.addSql(
      `alter table if exists "promotion" add constraint "promotion_type_check" check("type" in ('standard', 'buyget', 'bank'));`
    )
  }
}
