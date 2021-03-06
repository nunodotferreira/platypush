from platypush.message.event import Event


class BluetoothEvent(Event):
    pass


class BluetoothDeviceConnectedEvent(Event):
    """
    Event triggered on bluetooth device connection
    """
    def __init__(self, address: str = None, port: str = None, *args, **kwargs):
        super().__init__(*args, address=address, port=port, **kwargs)


class BluetoothDeviceDisconnectedEvent(Event):
    """
    Event triggered on bluetooth device disconnection
    """
    def __init__(self, address: str = None, port: str = None, *args, **kwargs):
        super().__init__(*args, address=address, port=port, **kwargs)


class BluetoothConnectionRejectedEvent(Event):
    """
    Event triggered on bluetooth device connection rejected
    """
    def __init__(self, address: str = None, port: str = None, *args, **kwargs):
        super().__init__(*args, address=address, port=port, **kwargs)


class BluetoothFilePutRequestEvent(Event):
    """
    Event triggered on bluetooth device file transfer put request
    """
    def __init__(self, address: str = None, port: str = None, *args, **kwargs):
        super().__init__(*args, address=address, port=port, **kwargs)


class BluetoothFileGetRequestEvent(Event):
    """
    Event triggered on bluetooth device file transfer get request
    """
    def __init__(self, address: str = None, port: str = None, *args, **kwargs):
        super().__init__(*args, address=address, port=port, **kwargs)


class BluetoothFileReceivedEvent(Event):
    """
    Event triggered on bluetooth device file transfer put request
    """
    def __init__(self, path: str = None, *args, **kwargs):
        super().__init__(*args, path=path, **kwargs)


# vim:sw=4:ts=4:et:
