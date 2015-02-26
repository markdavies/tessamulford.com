class CreatePages < ActiveRecord::Migration
  def change
    create_table :pages do |t|
      t.string :title
      t.string :slug
      t.text :content
      t.text :sidebar
      t.timestamps null: false
    end
  end
end
