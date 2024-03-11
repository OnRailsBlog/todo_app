class Todo < ApplicationRecord
  after_create :set_priority
  broadcasts_refreshes

  private

  def set_priority
    self.priority = id
    save
  end
end
