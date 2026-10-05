import { describe, expect, it } from "vitest"
import { cased, splitWords } from "@/index"

describe("splitWords", () => {
  it("breaks a lower case letter before an upper case one", () => {
    expect(splitWords("borderRadius")).toEqual(["border", "Radius"])
  })

  it("keeps an upper case run whole until the next lower case letter", () => {
    expect(splitWords("HTTPServer")).toEqual(["HTTP", "Server"])
  })

  it("drops a non-alphanumeric and splits around it", () => {
    expect(splitWords("hello_world-foo bar")).toEqual(["hello", "world", "foo", "bar"])
  })

  it("keeps a digit run as a word of its own", () => {
    expect(splitWords("foo2bar")).toEqual(["foo", "2", "bar"])
  })

  it("starts on the first letter and drops a leading digit", () => {
    expect(splitWords("2foo")).toEqual(["foo"])
    expect(splitWords("--ink")).toEqual(["ink"])
  })

  it("drops a leading digit run but keeps a later one", () => {
    expect(splitWords("123abc123")).toEqual(["abc", "123"])
  })
})

describe("CaseConvert", () => {
  it("builds every case from one split", () => {
    const name = cased("HTTPServer-error_2")
    expect(name.words).toEqual(["HTTP", "Server", "error", "2"])
    expect(name.camel()).toBe("httpServerError2")
    expect(name.pascal()).toBe("HttpServerError2")
    expect(name.kebab()).toBe("http-server-error-2")
    expect(name.snake()).toBe("http_server_error_2")
    expect(name.constant()).toBe("HTTP_SERVER_ERROR_2")
    expect(name.dot()).toBe("http.server.error.2")
    expect(name.space()).toBe("http server error 2")
    expect(name.title()).toBe("Http Server Error 2")
  })
})
