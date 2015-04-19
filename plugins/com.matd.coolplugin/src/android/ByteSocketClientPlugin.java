
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import android.util.Log;
import android.provider.Settings;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.net.Socket;
import java.net.UnknownHostException;
import android.content.Context;

public class ByteSocketClientPlugin extends CordovaPlugin {
	public static IOClass ioclass;
	public static Boolean writeLogs = true; 
	public static String sent="";
	public static int[] b={65,75,85};
	public static Boolean connected = false;
	public static String SockError = "";
	//	public static int[] sts;
	private static final int SERVERPORT = 4514;
	private static final String SERVER_IP = "192.168.2.38";
	/**
	* Constructor.
	*/
	public ByteSocketClientPlugin() {

	}
	/**
	* Sets the context of the Command. This can then be used to do things like
	* get file paths associated with the Activity.
	*
	* @param cordova The context of the main Activity.
	* @param webView The CordovaWebView Cordova is running in.
	*/
	public void initialize(CordovaInterface cordova, CordovaWebView webView) {
		super.initialize(cordova, webView);
	    	ioclass = new IOClass(SERVER_IP,SERVERPORT);
	}
	public boolean execute(final String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
		final int duration = Toast.LENGTH_SHORT;
		cordova.getActivity().runOnUiThread(new Runnable() {
			public void run() {
				/*
				String[] data = action.split(",");
				if(data.length>0)
				{
					b = new int[data.length];
					for(int i = 0;i < data.length;i++)
						b[i] = Integer.valueOf(data[i]);
					Toast toast = Toast.makeText(cordova.getActivity().getApplicationContext(), "Sending New Data\n"+action, duration);
					toast.show();
				}
				else
				{
				*/
					Toast toast = Toast.makeText(cordova.getActivity().getApplicationContext(), action, duration);
					toast.show();
				/*
				}
				new Thread(new ClientThread()).start();
				*/
			}
		});
		return true;
	}
	class ClientThread implements Runnable {
		@Override
		public void run() {
			//socketBussy = true;
			try {
				ioclass.open();
				
				if(writeLogs)
					sent += "Tread Log : TRUE";
				
				ioclass.sendSimpleData(b);
				connected = ioclass.connected;
				SockError = ioclass.SockError;
				
			} catch (Exception e) {
				if(writeLogs)
					sent += "TreadError : "+e.getMessage()+"\n";
			}
			//socketBussy = false;
		}
	}



	class IOClass {
		Boolean isTcp = true;
		String SERVER_IP = "192.168.0.3";
		int SERVER_PORT = 43002;
		Boolean connected = false;
		Socket socket;
		String SockError="";
		Boolean crcok = false;
		int bfs = 65;
		Context mContext;
		
		public IOClass(String IPAddr,int port)
		{
			if(!IPAddr.equals(""))
				SERVER_IP = IPAddr;
			if(port > 0)
				SERVER_PORT = port;
		}
		public void open()
		{
				if(socket != null)
					connected = socket.isConnected();
				else
					connected = false;
				if(!connected)
				{
					try {
						InetAddress serverAddr = InetAddress.getByName(SERVER_IP);
						socket = new Socket(serverAddr, SERVER_PORT);
						connected = true;
						SockError = "";
					} catch (UnknownHostException e) {
						SockError = "Open() UnknownHostException : "+e.getMessage();
					} catch (IOException e) {
						SockError = "Open() IOException : "+e.getMessage();
					} catch (Exception e) {
						SockError = "Open() Exception : "+e.getMessage();
					}
				}
		}
		public void sendSimpleData(int[] b)
		{
			try {
				//byte[] tmp_sts = new byte[1024];
				byte[] bb = new byte[b.length];
				for(int i = 0;i < b.length;i++)
					bb[i] = (byte)b[i];
				DataOutputStream outToServer = new DataOutputStream(socket.getOutputStream());
				//DataInputStream inFromServer = new DataInputStream(socket.getInputStream());
				outToServer.write(bb);
				//inFromServer.read(tmp_sts);

			} catch (IOException e) {
				connected = false;
				SockError = "SendData() IOException : "+e.getMessage();
			} catch (Exception e) {
				connected = false;
				SockError = "SendData() Exception : "+e.getMessage();
			}
		}
	}






}







