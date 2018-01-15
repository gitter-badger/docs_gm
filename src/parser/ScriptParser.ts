import parse = require("comment-parser");
import DocScript from "../docs_models/DocScript";
import { IGMScript } from "../IGMInterfaces";
import ReporterManager from "../reporter/ReporterManager";
import DocScriptFactory from "./DocScriptFactory";
import OutputConfig from "./OutputConfig";
import Validator from "./Validator";

/**
 * Class for parsing the GML scripts and JSDocs comments inside those scripts
 */
export default class ScriptParser {

	/**
	 * config object
	 */
	private _config: OutputConfig;

	/**
	 * Creates a ScriptParser instance
	 */
	public constructor(config: OutputConfig) {
		this._config = config;
	}

	/**
	 * Parses a GMScript
	 * @param script An array with DocScript objects
	 */
	public parseScript(script: IGMScript): DocScript[] {
		const arr = [];
		for (const [name, text] of script.subScripts()) {
			const docScript = this._createDocScript(name, text);
			const validator = new Validator(docScript, this._config);
			if (validator.validateDocScript() && validator.checkGMLFeaturesMatchDocs(text)) {
				arr.push(docScript);
			}
		}
		return arr;
	}

	/**
	 * Parses a gml script string and extracts all the documentation for a passed script
	 * and returns a new DocScript object.
	 * @param name The script name
	 * @param text The script content
	 * @returns A new DocStript object
	 */
	private _createDocScript(name: string, text: string): DocScript {

		const comments = parse(text);

		const factory = new DocScriptFactory(name);

		for (const comment of comments) {
			if (comment.description) {
				factory.setDescription(comment.description);
			}
			for (const tag of comment.tags) {
				this._parseTag(factory, tag, name);
			}
		}
		if (this._config.markUnderscoreScriptsAsPrivate && name.charAt(0) === "_") {
			factory.markPrivate();
		}
		return factory.make();
	}

	/**
	 * Parse a single tag and add the tag to the DocScriptFactory
	 * @param factory The factory to add the tag to
	 * @param tag The tag to add
	 * @param name The name of the script to add the tag to
	 */
	private _parseTag(factory: DocScriptFactory, tag: CommentParser.Tag, name: string) {
		switch (tag.tag.toLowerCase()) {
			case "param":
			case "arg":
			case "argument":
				factory.addParam(tag.name, tag.type, tag.optional, tag.description);
				break;
			case "description":
			case "desc":
				factory.setDescription(this._reconstructTag(tag));
				break;
			case "private":
				factory.setDescription(this._reconstructTag(tag));
				factory.markPrivate();
				break;
			case "returns":
			case "return":
				factory.setReturns(tag.type, tag.description);
				break;
			case "example":
				factory.addExample(this._reconstructTag(tag));
				break;
			case "function":
			case "func":
			case "method":
				factory.setFunction(this._reconstructTag(tag));
				break;
			default:
				if (this._config.warnUnrecognizedTags) {
					ReporterManager.reporter.warn(`Unrecognized tag "${ tag.tag.toLowerCase() }" at script "${ name }"`);
				}
		}
	}

	/**
	 * Recreates the content of a splitted tag into a single string.
	 * For example, in a description tag, if you start your description
	 * with {} or with [], then the ComentParser will treat those brackets
	 * like an optional argument. This script, recreates the original description
	 * tag.
	 * @param tag The tag to reconstruct
	 */
	private _reconstructTag(tag: CommentParser.Tag): string {
		// TODO: reconstruct tag from tag.source.
		const strArr = [];
		if (tag.type) {
			strArr.push(`{${tag.type}}`);
		}
		if (tag.name) {
			strArr.push((tag.optional) ? "[" + tag.name + "]" : tag.name);
		}
		if (tag.description) {
			strArr.push(tag.description);
		}
		return strArr.join(" ");
	}
}
