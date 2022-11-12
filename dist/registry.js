import { tagFactory } from "./factory";
const tag_registry = [];
const registry = {
    get registry() {
        return [...tag_registry];
    },
    add(tag) {
        tag_registry.push(tag);
    },
    get_tag_methods(arr) {
        return registry.registry.filter((fF) => arr.includes(fF.name));
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
        this.remove_tag();
        const loop_holder = this.el.setAttribute("bx-each-id", this.tag_id);
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
                    let $item = loop_html.insertAfter(loop_holder);
                    loop_method.call(BX, i, $item, each_context);
                }
                loop_holder.remove();
            },
        };
    },
    clean() { },
}));
export default registry;
//# sourceMappingURL=registry.js.map