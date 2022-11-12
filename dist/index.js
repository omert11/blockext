import { tagFactory } from "./factory";
import registry from "./registry";
function default_each_method(el, context, loop_method, RC) {
    el.childNodes.forEach((item, i) => loop_method.call(RC, i, item, context));
}
class BlockeXt {
    constructor(selectorOrElement) {
        let el = null;
        if (typeof selectorOrElement == "string") {
            el = document.querySelector(selectorOrElement);
            if (!el)
                throw Error(`No element found in the dom with selector '${selectorOrElement}'.`);
        }
        else
            el = selectorOrElement;
        this.el = el;
        this.main_elements = this.el.querySelectorAll("[bx-main]");
        this.tag_instances = [];
        this.collect_tags(this.el);
    }
    collect_tags(el, regexp = /bx-(.*?)="(.*?)"/g) {
        let match_result = Array.from(el.outerHTML.matchAll(regexp));
        let used_tags = [];
        match_result.forEach((r) => {
            if (!used_tags.includes(r[0]))
                used_tags.push(r[0]);
        });
        this.used_tags = used_tags;
        this.tags = registry.get_tag_methods(this.used_tags);
    }
    get_filtered_TAGS(type) {
        if (!this[`__${type}_tag_cache`])
            this[`__${type}_tag_cache`] = this.tags.filter((i) => i.type == type);
        return this[`__${type}_tag_cache`];
    }
    *get_TAG_iter(el, context, tags) {
        for (const tag of tags) {
            let attribute = el.getAttribute(`bx-${tag.name}`);
            if (attribute) {
                const tag_instance = tag({ el, context });
                yield tag_instance;
            }
        }
    }
    get each_tags() {
        return this.get_filtered_TAGS(TagType.each);
    }
    get_each_tags(el, context) {
        return this.get_TAG_iter(el, context, this.each_tags);
    }
    main_loop(data) {
        this.main_elements.forEach((el) => this.top_loop(el, data, default_each_method));
    }
    top_loop(el, context, each_method) {
        each_method(el, context, this.loop, this);
    }
    loop(i, item, context) {
        let each_response = this.do_each(item, context);
        this.top_loop(item, context, each_response.each_method);
    }
    do_each(el, context) {
        let each_tag = this.get_each_tags(el, context).next().value;
        return each_tag ? each_tag.use() : { break_loop: false, context: context };
    }
}
export default BlockeXt;
export { BlockeXt, registry, tagFactory };
//# sourceMappingURL=index.js.map