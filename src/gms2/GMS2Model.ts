import * as GMS2Descriptor from "./GMS2Descriptor";

export default class GMS2Model {

    /**
     * The ID of the YoYo Model
     */
    public id: string;

    /**
     * The name of the YoYo Model
     */
    public modelName: string;

    /**
     * The MVC version of the YoYo Model
     */
    public mvc: string;

    /**
     * Creates a new GMS2 Model
     * @param data The YOYO Model data for this resource
     */
    constructor(data: GMS2Descriptor.Model) {
        this.id = data.id;
        this.modelName = data.modelName;
        this.mvc = data.mvc;
    }
}
