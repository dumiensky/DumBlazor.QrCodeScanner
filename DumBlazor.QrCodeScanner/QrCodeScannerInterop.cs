using Microsoft.JSInterop;

namespace DumBlazor.QrCodeScanner;

public class QrCodeScannerInterop : IAsyncDisposable
{
    DateTime? _lastScanTimestamp;

    Action<string>? _qrCodeScanned;
    Action<string>? _qrCodeError;
    double _scanInterval;

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
        _scanInterval = interval.TotalMilliseconds;

        var dotNetRef = DotNetObjectReference.Create(this);

        var module = await _moduleTask.Value;
        await module.InvokeVoidAsync("DumBlazorScanner.Init", dotNetRef, canvasId, width, highlightColor);
    }
    
    [JSInvokable]
    public Task CodeScannedCallback(string value)
    {
        if (!_lastScanTimestamp.HasValue || _lastScanTimestamp.Value < DateTime.UtcNow.AddMilliseconds(-_scanInterval))
        {
            _lastScanTimestamp = DateTime.UtcNow;
            _qrCodeScanned?.Invoke(value);
        }

        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task ErrorCallback(string value)
    {
        _qrCodeError?.Invoke(value);

        return Task.CompletedTask;
    }

    public async ValueTask DisposeAsync()
    {
        if (_moduleTask.IsValueCreated)
        {
            var module = await _moduleTask.Value;
            await module.DisposeAsync();
        }
    }
}