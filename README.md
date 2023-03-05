# DumBlazor.QrCodeScanner

This nuget wraps [jsQR](https://github.com/cozmo/jsQR) in form of a simple component.
No additional configuration, scripts or injects needed.
Just place the component and provide a `OnCodeScanned` handler method.

## Requirements

No additional requirements are needed

## Installation

Install nuget package : [DumBlazor.QrCodeScanner](https://www.nuget.org/packages/DumBlazor.QrCodeScanner/)

dotnet cli: `dotnet add package DumBlazor.QrCodeScanner`  
Package Manager: `Install-Package DumBlazor.QrCodeScanner`

## Usage

Place `<QrCodeScanner />` Blazor component wherever needed.

```
@using DumBlazor.QrCodeScanner

<QrCodeScanner OnCodeScanned="HANDLER" />
```

`OnCodeScanned` is an `[EditorRequired]` parameter and the component expects it to be provided.

## All Configuration Parameters

| Parameter      | Type           | Required | Description                                                       |
|----------------|----------------|----------|-------------------------------------------------------------------|
| OnCodeScanned  | Action<string> | Yes      | Method to invoke on code scan                                     |
| OnError        | Action<string> | No       | Method to invoke on initialization or code scan error             |
| OnReady        | Action         | No       | Method to invoke on successful initialization                     |
| Width          | string         | No       | Set the fixed width of canvas in pixels                           |
| Interval       | TimeSpan       | No       | Minimal interval between successful scans. Default: TimeSpan.Zero |
| HighlightColor | string         | no       | Highlight color of a found QR Code on canvas. Default: #FF3B58    |

## Notes

This wrapper uses [jsQR](https://github.com/cozmo/jsQR) to handle code scans. The wrapper was inspired by [YannVasseur35's implementation](https://github.com/YannVasseur35/ReactorBlazorQRCodeScanner)
