module TurboStreamsActionsHelper
  module CustomTurboStreamActions
    def animated_remove(target)
      action :animated_remove, target, allow_inferred_rendering: false
    end

    def animated_append(target, content = nil, **, &block)
      action(:animated_append, target, content, **, &block)
    end
  end

  Turbo::Streams::TagBuilder.prepend(CustomTurboStreamActions)
end
