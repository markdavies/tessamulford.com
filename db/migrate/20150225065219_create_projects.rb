class CreateProjects < ActiveRecord::Migration
  def change
    create_table :projects do |t|
      t.string :title
      t.string :slug
      t.text :description
      t.text :credits
      t.string :url
      t.text :feature
      t.text :body
      t.boolean :status, default: true
      t.timestamps null: false
    end
  end
end
