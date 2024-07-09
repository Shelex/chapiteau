package reportparser

import (
	"archive/zip"
	"bytes"
	"chapiteau/internal/models"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"strings"
)

func ParseIndexHTML(f multipart.File) (*models.Report, error) {
	htmlContent, err := io.ReadAll(f)
	if err != nil {
		return nil, fmt.Errorf("error reading HTML file: %w", err)
	}

	// Extract the base64 string
	htmlString := string(htmlContent)
	start := strings.Index(htmlString, "window.playwrightReportBase64 = \"") + len("window.playwrightReportBase64 = \"")
	end := strings.Index(htmlString[start:], "\";") + start

	base64Header := "data:application/zip;base64,"
	base64String := strings.TrimPrefix(htmlString[start:end], base64Header)

	// Decode the base64 string into zip
	zipArchive, err := base64.StdEncoding.DecodeString(base64String)
	if err != nil {
		return nil, fmt.Errorf("error decoding base64 string: %w", err)
	}

	// Unzip the decoded data
	zipReader, err := zip.NewReader(bytes.NewReader(zipArchive), int64(len(zipArchive)))
	if err != nil {
		return nil, fmt.Errorf("error unzipping data: %w", err)
	}

	// find report.json data in decoded zip archive
	var reportJson []byte
	for _, file := range zipReader.File {
		if file.Name != "report.json" {
			continue
		}
		rc, err := file.Open()
		if err != nil {
			return nil, fmt.Errorf("error opening report.json: %w", err)
		}
		reportJson, err = io.ReadAll(rc)
		rc.Close()
		if err != nil {
			return nil, fmt.Errorf("error reading report.json: %w", err)
		}
		break
	}

	if reportJson == nil {
		return nil, fmt.Errorf("report.json not found in the zip archive")
	}

	var report models.Report

	if err := json.Unmarshal(reportJson, &report); err != nil {
		return nil, fmt.Errorf("error unmarshalling report.json: %w", err)
	}

	return &report, nil
}
