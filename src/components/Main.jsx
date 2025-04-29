const { useState, useRef } = require("react");
const fengari = require("fengari-web");

function Main() {
    const [string, setString] = useState("");
    const [result, setResult] = useState("");
    const [pattern, setPattern] = useState("");
    const resultDivRef = useRef(null);

    const executeLuaFunction = (inputString, inputPattern) => {
        try {
            let func = fengari.load(`
        return function(inputString, inputPattern)
          local captures = { string.match(inputString, inputPattern) }
          if #captures == 0 then return "" end
          return table.concat(captures, "ˍ")
        end`)();

            return func.call(inputString, inputPattern);
        } catch (error) {
            console.error("Lua execution error:", error);
            return "Error: Invalid pattern or input";
        }
    };

    const onChangeString = (event) => {
        const newString = event.target.value.trim();
        setString(newString);
        setResult(executeLuaFunction(newString, pattern));
    };

    const onChangePatterns = (event) => {
        const newPattern = event.target.value.trim();
        setPattern(newPattern);
        setResult(executeLuaFunction(string, newPattern));
    };

    const colors = ["#ff4c4c", "#4cff4c", "#4c4cff", "#ffcc00", "#ff66ff"];

    const highlightMatches = (text, matches) => {
        let lastIndex = 0;
        let coloredText = [];

        const matchIdMap = {};
        matches.forEach((match, idx) => {
            matchIdMap[match] = `match-${idx}`;
        });

        matches.forEach((word, index) => {
            const start = text.indexOf(word, lastIndex);
            if (start === -1) return;
            const end = start + word.length;

            if (start > lastIndex) {
                coloredText.push(text.substring(lastIndex, start));
            }

            coloredText.push(
                <span
                    key={index}
                    id={matchIdMap[word]}
                    style={{
                        backgroundColor: colors[index % colors.length],
                        padding: "2px 4px",
                        borderRadius: "3px"
                    }}
                >
          {word}
        </span>
            );
            lastIndex = end;
        });

        if (lastIndex < text.length) {
            coloredText.push(text.substring(lastIndex));
        }

        return coloredText;
    };

    const scrollToMatch = (match) => {
        if (!resultDivRef.current) return;

        const matches = result.split("ˍ").filter(m => m !== "");
        const matchId = `match-${matches.indexOf(match)}`;
        const element = document.getElementById(matchId);

        if (element) {
            const offsetTop = element.offsetTop - resultDivRef.current.offsetTop;
            resultDivRef.current.scrollTop = offsetTop - 20;

            element.style.transition = "background-color 0.5s";
            const originalColor = element.style.backgroundColor;
            element.style.backgroundColor = "#FFFFFF";
            setTimeout(() => {
                element.style.backgroundColor = originalColor;
            }, 1000);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="center">
                <div style={{ width: "800px", marginTop: "5vh" }} className="input-group mb-3">
                    <input
                        onChange={onChangePatterns}
                        style={{
                            backgroundColor: "#313537",
                            borderColor: "#313537",
                            color: "#d3d3d3",
                            fontSize: "1.1rem",
                            padding: "10px 15px",
                            height: "auto"
                        }}
                        id="patterns"
                        type="text"
                        className="form-control"
                        placeholder="Lua Patterns (e.g. %d+ to match numbers)"
                        aria-label="Lua Patterns"
                        aria-describedby="basic-addon2"/>
                    <div className="input-group-append">
            <span className="input-group-text" id="basic-addon2" style={{
                borderBottomLeftRadius: "0px",
                borderTopLeftRadius: "0px",
                backgroundColor: "#313537",
                borderColor: "#313537",
                color: result && result !== "Error: Invalid pattern or input" ? "green" : "red",
                fontSize: "1.1rem",
                padding: "10px 15px"
            }}>
              <strong>{result && result !== "Error: Invalid pattern or input" ? "Matches" : "No Matches"}</strong>
            </span>
                    </div>
                </div>
            </div>

            <div className="center">
                <div style={{ display: "flex", width: "800px" }}>
          <textarea
              onChange={onChangeString}
              style={{
                  resize: "none",
                  width: "50%",
                  borderColor: "#313537",
                  backgroundColor: "#313537",
                  color: "#d3d3d3",
                  fontSize: "1.1rem",
                  padding: "15px"
              }}
              placeholder="Enter your text here"
              className="form-control"
              rows="10"/>
                    <div
                        ref={resultDivRef}
                        className="card mx-3"
                        style={{
                            backgroundColor: "#313537",
                            width: "50%",
                            height: "25rem",
                            overflow: "auto",
                            fontSize: "1.1rem",
                            padding: "5px"
                        }}
                    >
                        <div className="card-body">
                            <p className="card-text" style={{ color: "#d3d3d3" }}>
                                {string && result && result !== "Error: Invalid pattern or input"
                                    ? highlightMatches(string, result.split("ˍ").filter(word => word !== ""))
                                    : "Your result will be displayed here, currently no matches"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                marginTop: "30px",
                textAlign: "center",
                width: "800px",
                backgroundColor: "#252729",
                borderRadius: "10px",
                padding: "15px 0",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
            }}>
                <h4 style={{ color: "#d3d3d3", marginBottom: "15px" }}>Captured Groups:</h4>
                <div style={{
                    maxHeight: "300px",
                    overflow: "auto",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center"
                }}>
                    {result && result !== "Error: Invalid pattern or input" ? (
                        result.split("ˍ").filter(match => match !== "").map((match, index) => (
                            <div
                                key={index}
                                style={{
                                    color: "#ffcc00",
                                    margin: "10px",
                                    padding: "10px",
                                    cursor: "pointer",
                                    backgroundColor: "rgba(49, 53, 55, 0.9)",
                                    borderRadius: "5px",
                                    minWidth: "120px",
                                    transition: "all 0.2s",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
                                }}
                                onClick={() => scrollToMatch(match)}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(49, 53, 55, 1)"}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(49, 53, 55, 0.9)"}
                            >
                                <strong>Capture {index + 1}:</strong><br/>
                                <span style={{ color: "#14fc1c", wordBreak: "break-word" }}>{match}</span>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: "#d3d3d3" }}>No matches found</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Main;