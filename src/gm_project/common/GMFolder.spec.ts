import {
	Expect,
	Setup,
	Test,
	TestFixture,
} from "alsatian";

import GMResourceMock from "./__mock__/GMResourceMock.mock";
import GMFolder from "./GMFolder";

/* tslint:disable:max-classes-per-file completed-docs */

@TestFixture("GMFolder")
export class GMFolderFixture {

	public folder: GMFolder;

	public child: GMFolder;

	@Setup
	public setup() {
		this.folder = new GMFolder("my-name");
		this.child = new GMFolder("my-name-child");
		this.folder.addChild(this.child);
	}

	@Test("should get the name")
	public name() {
		Expect(this.folder.name).toBe("my-name");
	}

	@Test("should get the childrens")
	public children() {
		const arr = Array.from(this.folder.children);
		Expect(arr.length).toBe(1);
		Expect(arr).toContain(this.child);
	}

	@Test("should get the fullpath")
	public fullpath() {
		Expect(this.folder.fullpath).toBe("my-name/");
		Expect(this.child.fullpath).toBe("my-name/my-name-child/");
	}

	@Test("getSubtreeLeafs should get an array with the subtree direct leafs")
	public getSubtreeLeafs_directLeafs() {
		const a = new GMResourceMock();
		this.folder.addChild(a);
		const b = new GMResourceMock();
		this.folder.addChild(b);
		const arr = this.folder.getSubtreeLeafs();
		Expect(arr.length).toBe(2);
		Expect(arr).toContain(a);
		Expect(arr).toContain(b);
	}

	@Test("getSubtreeLeafs should get an array with the subtree recursive leafs")
	public getSubtreeLeafs_recursiveLeafs() {
		const a = new GMResourceMock();
		this.folder.addChild(a);
		const b = new GMResourceMock();
		this.child.addChild(b);
		const c = new GMResourceMock();
		this.child.addChild(c);

		const arr = this.folder.getSubtreeLeafs();
		Expect(arr.length).toBe(3);
		Expect(arr).toContain(a);
		Expect(arr).toContain(b);
		Expect(arr).toContain(c);
	}
}
