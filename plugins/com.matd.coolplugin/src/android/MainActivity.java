package com.mmcomp.socketclient;


import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.Toast;

public class MainActivity extends ActionBarActivity {
	public static Boolean socketBussy = false;
	private IOClass ioclass;
	public static Boolean writeLogs = true; 
	public static String sent="";
	public static int[] b={65,75,85};
	public static Boolean connected = false;
	public static String SockError = "";
//	public static int[] sts;
	private static final int SERVERPORT = 4514;
	private static final String SERVER_IP = "192.168.2.38";

	
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
	
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		Button bt1 = (Button) findViewById(R.id.button1);
		bt1.setOnClickListener(new OnClickListener() {
			
			@Override
			public void onClick(View arg0) {
				// TODO Auto-generated method stub
				sendData();
			}
		});
		Button bt2 = (Button) findViewById(R.id.button2);
		bt2.setOnClickListener(new OnClickListener() {
			
			@Override
			public void onClick(View arg0) {
				// TODO Auto-generated method stub
				Toast.makeText(getApplicationContext(), sent, Toast.LENGTH_LONG).show();
			}
		});
	}

	public void sendData(){
		//if(!socketBussy)
			new Thread(new ClientThread()).start();
		//else
			//Toast.makeText(getApplicationContext(),"Socket Bussy\n"+sent,Toast.LENGTH_LONG).show();
	}
	
	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.main, menu);
	    ioclass = new IOClass(SERVER_IP,SERVERPORT,this);
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		// Handle action bar item clicks here. The action bar will
		// automatically handle clicks on the Home/Up button, so long
		// as you specify a parent activity in AndroidManifest.xml.
		int id = item.getItemId();
		if (id == R.id.action_settings) {
			return true;
		}
		return super.onOptionsItemSelected(item);
	}
}
