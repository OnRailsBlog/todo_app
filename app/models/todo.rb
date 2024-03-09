class Todo < ApplicationRecord
  after_create :set_priority

  private

  def set_priority
    self.priority = id
    save
  end
end
