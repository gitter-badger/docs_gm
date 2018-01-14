import {
	Expect,
	SetupFixture,
	TeardownFixture,
	Test,
	TestFixture,
} from "alsatian";

import * as mock from "mock-fs";
import * as nunjucks from "nunjucks";
import DocProject from "../docs_models/DocProject";
import DocScript from "../docs_models/DocScript";
import Page from "./Page";

/* tslint:disable:max-classes-per-file completed-docs */

@TestFixture("Page")
export class PageFixture {

	public env: nunjucks.Environment;

	public script1: DocScript;

	public script2: DocScript;

	public docProject: DocProject;

	@SetupFixture
	public setupFixture() {

		this.script1 = new DocScript();
		this.script1.name = "my_script_name1";

		this.script2 = new DocScript();
		this.script2.name = "my_script_name2";

		this.docProject = new DocProject();
		this.docProject.name = "My project name";
		this.docProject.scripts.push(this.script1);
		this.docProject.scripts.push(this.script2);

		mock({
			"path/page_script.njk": `<h1>{{ page.script.name }}</h1>`,
			"path/page_scripts.njk": `<h1>{{ page.scripts[0].name }}</h1>`,
		});

		this.env = nunjucks.configure("path", { autoescape: false });
	}

	@TeardownFixture
	public teardownFixture() {
		mock.restore();
	}

	@Test("should render the page with a multipage template")
	public generateMultipage() {
		const page = new Page("page_script.njk", "{{ page.script.name }}.html", "script");

		const it = page.generate(this.env, this.docProject);

		const [filename1, content1] = it.next().value;
		Expect(filename1).toBe("my_script_name1.html");
		Expect(content1).toBe("<h1>my_script_name1</h1>");

		const [filename2, content2] = it.next().value;
		Expect(filename2).toBe("my_script_name2.html");
		Expect(content2).toBe("<h1>my_script_name2</h1>");

		Expect(it.next().done).toBe(true);
	}

	@Test("should render the page with a onepage template")
	public generateOnepage() {
		const page = new Page("page_scripts.njk", "out.html", "scripts");

		const it = page.generate(this.env, this.docProject);

		const [filename, content] = it.next().value;
		Expect(filename).toBe("out.html");
		Expect(content).toBe("<h1>my_script_name1</h1>");

		Expect(it.next().done).toBe(true);
	}
}