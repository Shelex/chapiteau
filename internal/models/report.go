package models

type ReportStats struct {
	Total      int  `json:"total"`
	Expected   int  `json:"expected"`
	Unexpected int  `json:"unexpected"`
	Flaky      int  `json:"flaky"`
	Skipped    int  `json:"skipped"`
	Ok         bool `json:"ok"`
}

type ReportTestOutcome string

const OutcomeExpected ReportTestOutcome = "expected"
const OutcomeEUnexpected ReportTestOutcome = "unexpected"
const OutcomeFlaky ReportTestOutcome = "flaky"
const OutcomeSkipped ReportTestOutcome = "skipped"

type ReportTestLocation struct {
	File   string `json:"file"`
	Line   int    `json:"line"`
	Column int    `json:"column"`
}

type ReportTestAttachment struct {
	Name        string `json:"name"`
	ContentType string `json:"contentType"`
	Path        string `json:"path"`
}

type ReportTestResult struct {
	Attachments []ReportTestAttachment `json:"attachments"`
}

type ReportTest struct {
	TestID      string             `json:"testId"`
	Title       string             `json:"title"`
	ProjectName string             `json:"projectName"`
	Location    ReportTestLocation `json:"location"`
	Duration    int                `json:"duration"`
	Annotations []string           `json:"annotations"`
	Tags        []string           `json:"tags"`
	Outcome     string             `json:"outcome"`
	Path        []string           `json:"path"`
	Ok          bool               `json:"ok"`
	Results     []ReportTestResult `json:"results"`
}

type ReportMetadata struct {
	ActualWorkers int `json:"actualWorkers"`
}

type ReportFile struct {
	FileID   string       `json:"fileId"`
	FileName string       `json:"fileName"`
	Tests    []ReportTest `json:"tests"`
	Stats    ReportStats  `json:"stats"`
}

type Report struct {
	Metadata     ReportMetadata `json:"metadata"`
	StartTime    int64          `json:"startTime"`
	Duration     float64        `json:"duration"`
	Files        []ReportFile   `json:"files"`
	ProjectNames []string       `json:"projectNames"`
	Stats        ReportStats    `json:"stats"`
	Errors       []interface{}  `json:"errors"`
}

type BuildInput struct {
	Name      string `json:"name"`
	Url       string `json:"url"`
	ReportURL string `json:"reportUrl"`
}

type RunInput struct {
	Report Report     `json:"report"`
	Build  BuildInput `json:"build"`
}
