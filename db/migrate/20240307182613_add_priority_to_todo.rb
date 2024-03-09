class AddPriorityToTodo < ActiveRecord::Migration[7.1]
  def change
    add_column :todos, :priority, :integer
  end
end
