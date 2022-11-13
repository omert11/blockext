import { TagType } from "./enums";
import { tagFactory } from "./factory";
function createElementFromHTML(htmlString) {
    var div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}
const tag_registry = [];
const registry = {
    get registry() {
        return [...tag_registry];
    },
    add(tag) {
        tag_registry.push(tag);
    },
    get_tag_methods(arr) {
        return registry.registry.filter((fF) => arr.includes(fF._name));
    },
};
registry.add(tagFactory({
    name: "for",
    type: TagType.each,
    use() {
        this.base_attr = this.attr;
        let loop_data = this.data;
        if (!Array.isArray(loop_data))
            loop_data = [loop_data];
        this.remove_tag_attribute();
        this.el.setAttribute("bx-each-id", this.id);
        const loop_html = this.el.outerHTML;
        this.loop_html = loop_html;
        return {
            break_loop: false,
            context: null,
            each_method(el, context, loop_method, BX) {
                for (let i = 0; i < loop_data.length; i++) {
                    let each_context = {
                        ...loop_data[i],
                        "bx-for-counter": i + 1,
                        "bx-for-counter0": i,
                        "bx-for-first": i == 0,
                        "bx-for-last": i == loop_data.length - 1,
                    };
                    let item = createElementFromHTML(loop_html);
                    el.after(item);
                    loop_method.call(BX, i, item, each_context);
                }
                el.remove();
            },
        };
    },
    clean() { },
}));
export { registry };
//# sourceMappingURL=registry.js.map