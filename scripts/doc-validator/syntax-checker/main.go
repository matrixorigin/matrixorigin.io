// mo-sql-checker - MatrixOne SQL Syntax Checker CLI
// Uses the official MatrixOne SQL parser to validate SQL syntax

package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/matrixorigin/matrixone/pkg/sql/parsers"
	"github.com/matrixorigin/matrixone/pkg/sql/parsers/dialect"
)

// CheckRequest represents a single SQL check request
type CheckRequest struct {
	SQL string `json:"sql"`
}

// CheckResult represents the result of a SQL syntax check
type CheckResult struct {
	Valid   bool   `json:"valid"`
	Error   string `json:"error,omitempty"`
	SQL     string `json:"sql"`
}

// BatchRequest represents a batch of SQL statements to check
type BatchRequest struct {
	Statements []string `json:"statements"`
}

// BatchResponse represents the results of a batch check
type BatchResponse struct {
	Results []CheckResult `json:"results"`
}

func checkSQL(sql string) CheckResult {
	sql = strings.TrimSpace(sql)
	if sql == "" {
		return CheckResult{Valid: true, SQL: sql}
	}

	ctx := context.Background()
	_, err := parsers.ParseOne(ctx, dialect.MYSQL, sql, 1)

	if err != nil {
		return CheckResult{
			Valid: false,
			Error: err.Error(),
			SQL:   sql,
		}
	}

	return CheckResult{Valid: true, SQL: sql}
}

func main() {
	// Check command line arguments
	if len(os.Args) > 1 {
		// Single SQL mode: mo-sql-checker "SELECT * FROM t1"
		sql := strings.Join(os.Args[1:], " ")
		result := checkSQL(sql)
		output, _ := json.Marshal(result)
		fmt.Println(string(output))
		if result.Valid {
			os.Exit(0)
		} else {
			os.Exit(1)
		}
	}

	// Batch mode: read JSON from stdin
	// Input format: {"statements": ["SELECT 1", "SELECT 2", ...]}
	// Output format: {"results": [{"valid": true, "sql": "..."}, ...]}

	scanner := bufio.NewScanner(os.Stdin)
	// Increase buffer size for large inputs
	const maxCapacity = 10 * 1024 * 1024 // 10MB
	buf := make([]byte, maxCapacity)
	scanner.Buffer(buf, maxCapacity)

	var input strings.Builder
	for scanner.Scan() {
		input.WriteString(scanner.Text())
	}

	if err := scanner.Err(); err != nil {
		fmt.Fprintf(os.Stderr, "Error reading input: %v\n", err)
		os.Exit(1)
	}

	inputStr := strings.TrimSpace(input.String())
	if inputStr == "" {
		// No input, exit silently
		os.Exit(0)
	}

	var request BatchRequest
	if err := json.Unmarshal([]byte(inputStr), &request); err != nil {
		fmt.Fprintf(os.Stderr, "Error parsing JSON input: %v\n", err)
		os.Exit(1)
	}

	response := BatchResponse{
		Results: make([]CheckResult, len(request.Statements)),
	}

	for i, sql := range request.Statements {
		response.Results[i] = checkSQL(sql)
	}

	output, err := json.Marshal(response)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error encoding response: %v\n", err)
		os.Exit(1)
	}

	fmt.Println(string(output))
}
