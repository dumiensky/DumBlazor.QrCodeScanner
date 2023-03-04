using Microsoft.JSInterop;

namespace DumBlazor.QrCodeScanner;

internal class QrCodeScannerInterop : IAsyncDisposable
{
    DateTime? _lastScanTimestamp;

    Action<string>? _qrCodeScanned;
    Action<string>? _qrCodeError;
    int _scanInterval;

    readonly Lazy<Task<IJSObjectReference>> _moduleTask;

    public QrCodeScannerInterop(IJSRuntime jsRuntime)
    {
        _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>(
            "import", "./_content/DumBlazor.QrCodeScanner/js/QrCodeScannerInterop.js").AsTask());
    }

    public async ValueTask Init(Action<string> qrCodeScanned,
        Action<string>? qrCodeError,
        TimeSpan interval,
        string? width,
        string highlightColor,
        string canvasId)
    {
        _qrCodeScanned = qrCodeScanned;
        _qrCodeError = qrCodeError;
        _scanInterval = interval.Milliseconds;

        var module = await _moduleTask.Value;
        await module.InvokeVoidAsync("DumBlazorScanner.Init", canvasId, width, highlightColor);
    }
    
    [JSInvokable]
    public void CodeScannedCallback(string value)
    {
        if (!_lastScanTimestamp.HasValue || _lastScanTimestamp.Value < DateTime.UtcNow.AddMilliseconds(-_scanInterval))
        {
            _lastScanTimestamp = DateTime.UtcNow;
            _qrCodeScanned?.Invoke(value);
        }
    }
    
    [JSInvokable]
    public void ErrorCallback(string value) => _qrCodeError?.Invoke(value);

    public async ValueTask DisposeAsync()
    {
        if (_moduleTask.IsValueCreated)
        {
            var module = await _moduleTask.Value;
            await module.DisposeAsync();
        }
    }
}