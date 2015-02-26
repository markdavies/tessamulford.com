class CreateImages < ActiveRecord::Migration
  def change
    create_table :images do |t|
      t.string :attachment_dimensions
      t.string :image_type
      t.timestamps null: false
    end
  end
end
