import { Tag, TagArgs, TagConfig, factoryFunction } from "./interfaces";

const bx_tag_id = (() => {
    let tag_id = 0;
    return () => {
        tag_id++;
        return tag_id - 1;
    };
})();
function tagFactory(config: TagConfig): factoryFunction {
    const func = (args: TagArgs) => {
        const TAG = {
            id: bx_tag_id(),
            name: config.name,
            type: config.type,
            el: args.el,
            context: args.context,
            get_html_attribute(el: HTMLElement) {
                return el.getAttribute(`bx-${TAG.name}`);
            },
            get_data(attrs: string, context: any) {
                attrs.split(".").forEach((attr) => (context = context[attr]));
                return context;
            },
            remove_tag_attribute() {
                return TAG.el.removeAttribute(TAG.attr);
            },
            use() {
                return {
                    break_loop: false,
                    context: TAG.context,
                    ...config.use.call(TAG),
                };
            },
            clean() {
                if (config.clean) return config.clean.call(TAG);
            },
            get attr() {
                return TAG.get_html_attribute(TAG.el);
            },
            get data() {
                return TAG.get_data(TAG.attr, TAG.context);
            },
        };

        return TAG;
    };
    func.name = config.name;
    func.type = config.type;
    return func;
}

export { factoryFunction, tagFactory };
