class PrioritiesController < ApplicationController
  def update
    @todo = Todo.find_by_id params[:todo_id]
    @new_priority_todo = Todo.find_by_id params[:reorderable_target_id]

    if !@new_priority_todo.nil?
      old_priority = @todo.priority
      new_priority = @new_priority_todo.priority

      if old_priority > new_priority
        todos = todos(new_priority..old_priority)
        (0..(todos.length - 2)).each do |i|
          first_todo = todos[i]
          second_todo = todos[i + 1]
          temp_priority = first_todo[:priority]
          first_todo[:priority] = second_todo[:priority]
          second_todo[:priority] = temp_priority
        end
        todos[todos.length - 1][:priority] = new_priority
        Todo.upsert_all(todos)
      elsif old_priority < new_priority
        todos = todos(old_priority..new_priority)
        (todos.length - 1).downto(1).each do |i|
          first_todo = todos[i - 1]
          second_todo = todos[i]
          temp_priority = first_todo[:priority]
          second_todo[:priority] = first_todo[:priority]
          second_todo[:priority] = temp_priority
        end
        todos[0][:priority] = new_priority
        Todo.upsert_all(todos)
      end
    end
  end

  private

  def todos(range)
    Todo.where(priority: range).order(:priority)
      .pluck(:id, :priority, :updated_at, :created_at)
      .map { |id, priority, created_at, updated_at| {id: id, priority: priority, updated_at: updated_at, created_at: created_at} }
  end
end
