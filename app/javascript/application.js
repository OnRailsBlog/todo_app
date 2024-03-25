// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails";
import "controllers";

Turbo.StreamActions.animated_remove = async function () {
  this.targetElements.forEach(async (target) => {
    target.animate(
      [
        {
          transform: `scale(1)`,
          transformOrigin: "top",
          height: "auto",
          opacity: 1.0,
        },
        {
          transform: `scale(0.8)`,
          opacity: 0.2,
          height: "80%",
          offset: 0.8,
        },
        {
          transform: `scale(0)`,
          transformOrigin: "top",
          height: 0,
          opacity: 0,
        },
      ],
      {
        duration: 75,
        easing: "ease-out",
      }
    );
    await Promise.all(
      target.getAnimations().map((animation) => animation.finished)
    );
    target.remove();
  });
};

Turbo.StreamActions.animated_append = async function () {
  this.removeDuplicateTargetChildren();
  this.targetElements.forEach(async (target) => {
    target.append(this.templateElement.content);
    target.lastElementChild.animate(
      [
        {
          transform: `scaleY(0.0)`,
          transformOrigin: "top",
          height: "0",
          opacity: 0.0,
        },
        {
          transform: `scale(0.8)`,
          opacity: 0.2,
          height: "80%",
          offset: 0.2,
        },
        {
          transform: `scaleY(1)`,
          transformOrigin: "top",
          height: "auto",
          opacity: 1,
        },
      ],
      {
        duration: 100,
        easing: "ease-out",
      }
    );
  });
};
