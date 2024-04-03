import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="search"
export default class extends Controller {
  static values = { url: String };

  search(event) {
    Turbo.visit(`${this.urlValue}?${event.target.name}=${event.target.value}`, {
      action: "replace",
    });
  }

  animateRemovals(event) {
    if (event.detail.newElement == null && event.target.dataset.animateExit) {
      event.preventDefault();
      this.animateExit(event.target);
    }
  }

  animateInsertions(event) {
    if (
      event.target.childNodes.length > event.detail.newElement.childNodes.length
    ) {
      var existingIds = new Set();
      for (var i = 0; i < event.detail.newElement.childNodes.length; i++) {
        let child = event.detail.newElement.childNodes[i];
        if (
          child.nodeName != "#text" &&
          child.dataset.animateEntrance &&
          child.id != null
        ) {
          existingIds.add(child.id);
        }
      }
      for (var i = 0; i < event.target.childNodes.length; i++) {
        let child = event.target.childNodes[i];
        if (
          child.nodeName != "#text" &&
          child.dataset.animateEntrance &&
          child.id != null &&
          !existingIds.has(child.id)
        ) {
          this.animateEntrance(child);
        }
      }
    }
  }

  async animateEntrance(target) {
    target.animate(
      [
        {
          transform: `scale(0.8, 0.0)`,
          transformOrigin: "center",
          height: "0",
          opacity: 0.0,
        },
        {
          transform: `scale(0.9, 0.7)`,
          opacity: 0.2,
          height: "80%",
          offset: 0.2,
        },
        {
          transform: `scale(1, 1)`,
          transformOrigin: "center",
          height: "auto",
          opacity: 1,
        },
      ],
      {
        duration: 100,
        easing: "ease-out",
      }
    );
  }

  async animateExit(target) {
    target.animate(
      [
        {
          transform: `scale(1, 1)`,
          transformOrigin: "center",
          height: "auto",
          opacity: 1.0,
        },
        {
          transform: `scale(0.9, 0.7)`,
          opacity: 0.2,
          height: "80%",
          offset: 0.8,
        },
        {
          transform: `scaleY(0.8, 0)`,
          transformOrigin: "center",
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
  }
}
